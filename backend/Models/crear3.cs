using System;
using System.Collections.Generic;

namespace TiendaOnline.API.Models;

public partial class crear3
{
    public int id_carrito { get; set; }

    public int id_producto { get; set; }

    public string id_usuario { get; set; } = null!;

    public int cantidad { get; set; }

    public int total { get; set; }

    public virtual carritocompra id_carritoNavigation { get; set; } = null!;

    public virtual producto id_productoNavigation { get; set; } = null!;

    public virtual usuario id_usuarioNavigation { get; set; } = null!;
}
