using System;
using System.Collections.Generic;

namespace TiendaOnline.API.Models;

public partial class solicitar1
{
    public string id_usuario { get; set; } = null!;

    public int id_producto { get; set; }

    public int id_cotizacion { get; set; }

    public int precio { get; set; }

    public int cantidad { get; set; }

    public virtual cotizacion id_cotizacionNavigation { get; set; } = null!;

    public virtual producto id_productoNavigation { get; set; } = null!;

    public virtual usuario id_usuarioNavigation { get; set; } = null!;
}
