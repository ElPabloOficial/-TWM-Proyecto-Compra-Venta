using System;
using System.Collections.Generic;

namespace TiendaOnline.API.Models;

public partial class ofrecer1
{
    public string id_usuario { get; set; } = null!;

    public int id_producto { get; set; }

    public string tipobien { get; set; } = null!;

    public virtual producto id_productoNavigation { get; set; } = null!;

    public virtual usuario id_usuarioNavigation { get; set; } = null!;
}
